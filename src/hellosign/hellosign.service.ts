import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');
import * as HelloSign from 'hellosign-sdk';
import type { SignatureRequestRequestOptions, EventResponse } from 'hellosign-sdk';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Status } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';

import { QuotesService } from '../quotes/quotes.service';
import { GuardianApplicationService } from '../guardian/guardian-application.service';
import { getErrorMessage } from '../utils/getErrorMessage';
import { QuotesSubmissionHistoryService } from '../quotesSubmissionHistory/quotesSubmissionHistory.service';
import { RatesService } from '../rates/rates.service';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class HelloSignService {
  private readonly helloSignApiKey: string | undefined;
  private hellosign: HelloSign;

  constructor(
    private readonly quotesService: QuotesService,
    private readonly guardianApplicationService: GuardianApplicationService,
    private readonly configService: ConfigService,
    private readonly quotesSubmissionHistoryService: QuotesSubmissionHistoryService,
    private readonly ratesService: RatesService,
    private readonly documentsService: DocumentsService,
    private readonly logger: PinoLogger
  ) {
    this.helloSignApiKey = this.configService.get('HELLOSIGN_API_KEY');
    this.logger.setContext(HelloSignService.name);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.hellosign = require('hellosign-sdk')({
      key: this.helloSignApiKey,
    });
  }

  validateEvent(data: EventResponse<{ quoteId: string }>) {
    const { event } = data;
    const calculate_hash = crypto
      .createHmac('sha256', this.helloSignApiKey as string)
      .update(event.event_time + event.event_type)
      .digest('hex')
      .toString();

    const { event_hash } = event;
    return calculate_hash === event_hash;
  }

  async handleEvents(data: EventResponse<{ quoteId: string }>) {
    const { event, signature_request } = data;
    const { event_type } = event;
    const quoteId: string | undefined = signature_request?.metadata?.quoteId;
    const IS_FULL_LOGS = this.configService.get('IS_FULL_LOGS') === 'true';
    const PUBLIC_ENVIRONMENT = this.configService.get('PUBLIC_ENVIRONMENT');
    const printFullLog = PUBLIC_ENVIRONMENT !== 'production' && IS_FULL_LOGS;

    const genericMessage = `Event type "${event_type}" was sent to this callback. Associated application id: ${quoteId}`;
    const messages = [genericMessage];

    const quote = await this.quotesService.findOne({ id: quoteId });
    if (!quote) {
      const message = 'Could not find application with the quote id provided in metadata';
      if (event_type !== 'signature_request_remind' || PUBLIC_ENVIRONMENT === 'production') {
        // prevents false error when hellosign sends reminder event for a signature request associated with quote that has been wiped from the db
        this.logger.error(message);
      }
      messages.push(message);
      return messages;
    }

    switch (event_type) {
      case 'signature_request_sent':
        await this.quotesService.update(
          { id: quote.id },
          {
            status: Status.AWAITING_SIGNATURES,
            signatureRequestId: signature_request?.signature_request_id,
          }
        );
        this.logger.info(
          `Email signature request sent. Quote id: ${quote.id}. Signature request id: ${signature_request?.signature_request_id}`
        );
        break;
      case 'signature_request_signed':
        const signatures = signature_request?.signatures;
        const planHolder = signatures?.find((entry) => entry.signer_role === 'plan-holder');
        if (!planHolder) {
          this.logger.error(
            `Signer with role of "plan-holder" does not exist on the signatures array`
          );
          break;
        }
        const timeOfSignature = planHolder?.signed_at;
        if (timeOfSignature) {
          // signatureDate is in seconds
          const signatureDate = new Date(timeOfSignature * 1000).toLocaleString();
          await this.quotesService.update(
            { id: quote.id },
            {
              masterApplicationSignatureDate: moment(signatureDate).format('MM/DD/YYYY'),
            }
          );
          this.logger.info('Document signed by plan-holder');
        }
        break;
      case 'signature_request_all_signed':
        await this.quotesService.update(
          { id: quote.id },
          {
            status: Status.ALL_SIGNED,
          }
        );

        // Add Benefit Summaries to an Employer's Documents
        if (quote.employerId) {
          await this.documentsService.addBenefitInformationToEmployersDocuments(
            quote.employerId,
            quote.id
          );
        }

        messages.push(
          'signature_request_all_signed event successfully received, status of application has been updated to ALL_SIGNED'
        );
        this.logger.info('All parties have signed the document');

        // re-quote
        if (quote.transmissionGuid !== null || quote.status === Status.SUBMITTED) {
          const quotesSubmissionHistoryResults =
            await this.quotesSubmissionHistoryService.insertNewSubmissionHistoryEntry(
              quote.id,
              true
            );
          await this.ratesService.updateRateWithQuotesSubmissionHistoryId(
            quotesSubmissionHistoryResults.id,
            quote.id
          );
          await this.quotesService.update(
            { id: quote.id },
            {
              status: Status.SUBMITTED,
            }
          );
        } else {
          // first time quote
          let isSkipGuardian = false;
          const isProduction = this.configService.get('PUBLIC_ENVIRONMENT') === 'production';
          if (
            !!quote.correspondentFirstName?.match(/prod/i) &&
            !!quote.correspondentLastName?.match(/test/i) &&
            isProduction
          ) {
            isSkipGuardian = true;
          }

          try {
            if (!isSkipGuardian) {
              const response =
                await this.guardianApplicationService.authenticateAndSubmitApplication(quote.id);
              const message = printFullLog
                ? `Application submission to Guardian success! Transmission GUID: ${response?.transmission_guid} Message: ${response?.message}`
                : `Application submission to Guardian success! Transmission GUID: ${response?.transmission_guid}`;
              messages.push(message);
              this.logger.info(message);
            }

            const quotesSubmissionHistoryResults =
              await this.quotesSubmissionHistoryService.insertNewSubmissionHistoryEntry(
                quote.id,
                false
              );
            await this.ratesService.updateRateWithQuotesSubmissionHistoryId(
              quotesSubmissionHistoryResults.id,
              quote.id
            );

            if (isSkipGuardian) {
              await this.quotesService.update(
                { id: quote.id },
                {
                  status: Status.PROCESSED,
                  transmissionGuid: uuidv4(),
                }
              );
            } else {
              await this.quotesService.update(
                { id: quote.id },
                {
                  status: Status.SUBMITTED,
                }
              );
            }
          } catch (error) {
            const errorMsg = getErrorMessage(error);
            messages.push(`Application submission failed.`);
            messages.push(errorMsg);
            this.logger.error(`HelloSign event: ${errorMsg}`);
          }
        }

        break;
      case 'signature_request_declined':
      case 'signature_request_invalid':
      case 'file_error':
      case 'unknown_error':
      case 'sign_url_invalid':
      case 'template_error':
      case 'signature_request_email_bounce':
        this.logger.error(genericMessage);
        break;
      default:
        this.logger.info(genericMessage);
    }
    return messages;
  }

  async sendEmailRequest(options: SignatureRequestRequestOptions) {
    try {
      return await this.hellosign.signatureRequest.sendWithTemplate(options);
    } catch (error) {
      this.logger.error(`Email signature request error. Error: ${getErrorMessage(error)}`);
      throw new BadRequestException(
        `Email signature request error. Error: ${getErrorMessage(error)}`
      );
    }
  }

  async downloadFile(employerId: string) {
    try {
      const quote = await this.quotesService.findOne({ employerId });
      if (!quote) {
        this.logger.error(`No quote associated with the following employerId: ${employerId}`);
        throw new NotFoundException('Quote for this employer not found');
      }

      const signatureRequestId = quote.signatureRequestId;
      if (!signatureRequestId) {
        this.logger.error(`No application associated with the following employerId: ${employerId}`);
        throw new NotFoundException('Application for this employer not found');
      }
      return this.hellosign.signatureRequest.download(signatureRequestId, {
        file_type: 'pdf',
        get_url: true,
      });
    } catch (error) {
      this.logger.error(`Get file error. Error: ${getErrorMessage(error)}`);
      throw new BadRequestException(`Get file error. Error: ${getErrorMessage(error)}`);
    }
  }
}
