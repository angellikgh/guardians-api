import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  Res,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import {
  SignatureRequestRequestOptions,
  EventResponse,
  SignatureRequestResponse,
} from 'hellosign-sdk';
import { Request, Response, Express } from 'express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { HelloSignService } from './hellosign.service';
import { IgnoreTransformInterceptor } from '../utils/transform.interceptor';
import {
  HelloSignBadRequestResponse,
  HelloSignUnauthorizedResponse,
  HelloSignEventCallbackResponse,
  HelloDownloadFileResponse,
  HelloSignatureRequestResponse,
} from './entities/hellosign.entity';

@ApiTags('hellosign')
@Controller('hellosign')
export class HelloSignController {
  constructor(
    private readonly helloSignService: HelloSignService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(HelloSignController.name);
  }

  @Post()
  @IgnoreTransformInterceptor()
  @UseInterceptors(FileInterceptor('json'))
  @ApiResponse({
    description: 'Endpoint to collect Hellosign Events, used by Nestjs Sample FE.',
    type: HelloSignEventCallbackResponse,
    status: 201,
  })
  @ApiResponse({
    description:
      'Poorly formatted request to callback endpoint or invalid event data sent to callback in production mode.',
    type: HelloSignEventCallbackResponse,
    status: 400,
  })
  async eventCallback(
    @UploadedFile() _file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response
  ) {
    let data: EventResponse<{ quoteId: string; requestType: string }>;
    const PUBLIC_ENVIRONMENT = this.configService.get('PUBLIC_ENVIRONMENT');
    try {
      data = JSON.parse(req.body.json);
    } catch (error) {
      this.logger.error(
        'Event callback error. Unable to parse json due to incompatible formatting of request body.'
      );
      res
        .status(400)
        .send({ message: 'Unable to parse json due to incompatible formatting of request body' });
      return;
    }
    if (this.helloSignService.validateEvent(data) || PUBLIC_ENVIRONMENT !== 'production') {
      const response = await this.helloSignService.handleEvents(data);
      res.status(201).send({ message: 'Hello API Event Received', messages: response });
    } else {
      this.logger.error(
        'Unable to validate event. Invalid event data sent to callback in production mode.'
      );
      res.status(400).send({
        message:
          'Unable to validate event. All events sent to this callback in production mode must be from HelloSign.',
      });
    }
  }

  @UseGuards(AuthGuard('bearer'))
  @Post('/signatureRequest/sendWithTemplate')
  @ApiResponse({
    description: 'Send Hellosign email flow request.',
    status: 201,
    type: HelloSignatureRequestResponse,
  })
  @ApiResponse({
    description: 'Bad request sending Hellosign email request.',
    type: HelloSignBadRequestResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to create HelloSign email request with an unauthorized user.',
    type: HelloSignUnauthorizedResponse,
    status: 401,
  })
  async createEmailRequest(
    @Body() options: SignatureRequestRequestOptions
  ): Promise<SignatureRequestResponse> {
    return this.helloSignService.sendEmailRequest(options);
  }

  @UseGuards(AuthGuard('bearer'))
  @Get('/signatureRequest/files/:signatureRequestId')
  @ApiResponse({
    description: 'Download Hellosign file by signature request id.',
    status: 200,
    type: HelloDownloadFileResponse,
  })
  @ApiResponse({
    description: 'Bad request downloading HelloSign signature file.',
    type: HelloSignBadRequestResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to download file with an unauthorized user.',
    type: HelloSignUnauthorizedResponse,
    status: 401,
  })
  async downloadFile(@Param('signatureRequestId') signatureRequestId: string) {
    return this.helloSignService.downloadFile(signatureRequestId);
  }
}
