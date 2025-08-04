// Utils
import { validator } from 'twilio-flex-token-validator';

export const createResponse = () => {
  const response = new Twilio.Response()
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');  

  return response
}

type ErrorResponseOptions = {
  error?: unknown,
  message?: string,
  code?: number
}

export const createErrorResponse = ({error, message, code}: ErrorResponseOptions = {}) => {
  const response = createResponse()
  response.setStatusCode(code || 500)
  response.setBody({
    error: error,
    message: message,
  })

  return response
}

type ValidateTokenInput = {
  authorization?: string, 
  accountSid?: string, 
  accountToken?: string
}

export const validateToken = async ({authorization, accountSid, accountToken}:ValidateTokenInput ) => {
  if(!authorization || !accountSid || !accountToken) {
    throw new Error('Token is required.')
  }
  
  const validationResult: { valid?: boolean } = await validator(authorization, accountSid, accountToken)

  if(validationResult.valid !== true) {
    throw new Error('Invalid token.')
  }
}

type ValidateApiKeyInput = {
  requestKey?: string, 
  secretKey?: string
}

export const validateApiKey = async ({requestKey, secretKey}: ValidateApiKeyInput ) => {
  if(!requestKey) {
    throw new Error('Unauthorized')
  }

  if(!secretKey) {
    throw new Error('API key not configured')
  }

  if(requestKey !== secretKey) {
    throw new Error('Unauthorized')
  }
}

type FieldSchema = {
  type: 'string' | 'number' | 'boolean'
  required: boolean
}

type Schema = {
  [key: string]: FieldSchema
}

export const validateSchema = (schema: Schema, input: any) => {
  const errors: string[] = []
  const data: Record<string, any> = {} 

  for(const key in schema) {
    const fieldSchema = schema[key]
    const value = input[key]
    const hasValue = (value !== undefined) && (value !== null)

    if(fieldSchema.required && !hasValue) {
      errors.push(`${key} is required`)
      continue
    }

    if(hasValue && typeof value !== fieldSchema.type) {
      errors.push(`${key} must be a ${fieldSchema.type}`)
    }

    if(hasValue) {
      data[key] = value
    }
  }

  return {
    isValid: errors.length === 0,
    data,
    errors
  }
}