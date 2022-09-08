class ResHeaders {
  date: string;
  'content-type': string;
  'content-length': string;
  connection: string;
  'set-cookie': string[];
  server: string;
  'strict-transport-security': string;
  'x-ratelimit-limit': string;
  'x-ratelimit-limit-remaining': string;
  'x-ratelimit-reset': string;
  'access-control-allow-origin': string;
  'access-control-allow-headers': string;
  'access-control-allow-methods': string;
  'user-agent': string;
  vary: string;
  p3p: string;
}

class HelloSignCustomFields {
  name: string;
  type: string;
  required: boolean | null;
  api_id: string;
  editor: string | null;
  value: string;
}

class HelloSignSignatures {
  signature_id: string;
  has_pin: boolean;
  has_sms_auth: boolean;
  signer_email_address: string;
  signer_name: string;
  signer_role: string;
  order: number | null;
  status_code: string;
  signed_at: number | null;
  last_viewed_at: number | null;
  last_reminded_at: number | null;
  error: string | null;
}

export class HelloSignEventCallbackResponse {
  message: string;
  messages?: string[];
}

export class HelloSignUnauthorizedResponse {
  statusCode: number;
  message: string | string[];
}

export class HelloSignBadRequestResponse extends HelloSignUnauthorizedResponse {
  error: string;
}

export class HelloSignServiceUnavailableResponse {
  type: string;
  message: string;
  stack: string;
}

export class HelloDownloadFileResponse {
  file_url: string;
  expires_at: number;
  res_headers: ResHeaders;
  statusCode: number;
  statusMessage: string;
}

export class HelloSignatureRequestResponse {
  signature_request: {
    signature_request_id: string;
    test_mode: boolean;
    title: string;
    original_title: string;
    subject: string;
    message: string;
    metadata: {
      quoteId: string;
      requestType: string;
    };
    created_at: number;
    is_complete: boolean;
    is_declined: boolean;
    has_error: boolean;
    custom_fields: HelloSignCustomFields[];
    response_data: string[];
    signing_url: string;
    signing_redirect_url: string | null;
    final_copy_uri: string;
    files_url: string;
    details_url: string;
    requester_email_address: string;
    signatures: HelloSignSignatures[];
  };
  cc_email_addresses: string | string[];
  template_ids: string[];
  client_id: string;
  resHeaders: ResHeaders;
  statusCode: number;
  statusMessage: string;
}
