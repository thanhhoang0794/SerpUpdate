export interface ISendEmail {
  sender: string
  sendTo: string
  subject: string
  htmlBody: string
}

export interface IEmailValidation {
  id: string
  email: string
}

export interface IEmailValidationResponse {
  success?: boolean
  data?: IEmailValidation
  error?: {
    statusCode: number
    message: string
  }
}
