
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

export const validateApiKey = ({requestKey, secretKey}: ValidateApiKeyInput ) => {
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

type SchemaField = {
  type: 'string' | 'number' | 'boolean'
  required: boolean
}

type Schema = {
  [key: string]: SchemaField | SchemaField[] | Schema | Schema[]
}

type ValidateSchemaResult = {
  isValid: boolean,
  data: any,
  errors: string[]
}

export const validateSchema = (schema: Schema | SchemaField[], input: any): ValidateSchemaResult => {
  
  const errors: string[] = []
  let data: Record<string, any> | any[] = Array.isArray(schema) ? [] : {}

  const isSchemaField = (field: any): field is SchemaField => field && typeof field === 'object' && ('type' in field) && ('required' in field)

  if(Array.isArray(schema)) {

    if(!Array.isArray(input)) {

      errors.push('Input values must be an array')

    } else {
      
      const arraySchema = schema[0]
    
      if (isSchemaField(arraySchema)){                  
        
        const arrayData = []
        if(arraySchema.required && input.length === 0) {
          errors.push('Array must not be empty')
        }
        
        for(const item of input) { 

          const itemhasValue = (item !== undefined) && (item !== null)         

          if(arraySchema.required && !itemhasValue) {                          
            errors.push(`Array value is required`)
            continue
          }

          if(itemhasValue && typeof item !== arraySchema.type) {    
            errors.push(`Array value must be a ${arraySchema.type}`)
            continue
          }

          if(itemhasValue) {                                        
            arrayData.push(item)                                    
          }
        }

        data = arrayData
      
      } else {

        const arrayData = []
        for(const item of input) {                                
          const { 
            isValid: recursiveIsValid, 
            data: recursiveData, 
            errors: recursiveErrors 
          } = validateSchema(arraySchema as Schema, item);       

          errors.push(...recursiveErrors)
          arrayData.push(recursiveData)
        }

        data = arrayData
      }
    }
  } else {

    data = {}                        
  
    for(const key in schema) {
      const fieldSchema = schema[key]
      const isFieldSchemaArray = Array.isArray(fieldSchema)
      
      const value = input[key]       
      const isValueArray = Array.isArray(value)                                   
      const hasValue = (value !== undefined) && (value !== null)
      
      if(isFieldSchemaArray && !isValueArray) {                                   
        errors.push(`${key} must be an array`)
        continue
      }

      if(isFieldSchemaArray) {

        const arraySchema = fieldSchema[0]

        if (isSchemaField(arraySchema)){

          const arrayData = []
          if(arraySchema.required && value.length === 0) {
            errors.push('Array must not be empty')
          }

          for(const item of value) {
            
            const itemhasValue = (item !== undefined) && (item !== null)         

            if(arraySchema.required && !itemhasValue) {                          
              errors.push(`${key} is required`)
              continue
            }

            if(itemhasValue && typeof item !== arraySchema.type) {    
              errors.push(`${key} must be a ${arraySchema.type}`)
              continue
            }

            if(itemhasValue) {                                        
              arrayData.push(item)                                    
            }
          }

          data[key] = arrayData                                      

        } else {

          const arrayData = []
          for(const item of value) {                                
            const { 
              isValid: recursiveIsValid, 
              data: recursiveData, 
              errors: recursiveErrors 
            } = validateSchema(arraySchema as Schema, item);        

            errors.push(...recursiveErrors)
            arrayData.push(recursiveData)
          }
          
          data[key] = arrayData
          continue
        }
        
      } else if (!isSchemaField(fieldSchema)) {

        const { 
          isValid: recursiveIsValid, 
          data: recursiveData, 
          errors: recursiveErrors 
        } = validateSchema(fieldSchema as Schema, value);

        data[key] = recursiveData
        errors.push(...recursiveErrors)
        continue

      } else {

        if(fieldSchema.required && !hasValue) {
          errors.push(`${key} is required`)
          continue
        }

        if(hasValue && typeof value !== fieldSchema.type) {
          errors.push(`${key} must be a ${fieldSchema.type}`)
          continue
        }

        if(hasValue) {
          data[key] = value
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    data,
    errors
  }
}