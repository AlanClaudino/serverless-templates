// IMPORTS
import '@twilio-labs/serverless-runtime-types';

import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
  ServerlessEventObject,
  TwilioResponse,
} from '@twilio-labs/serverless-runtime-types/types';

// Import utility functions using require for dynamic asset path resolution
const { createResponse, createErrorResponse, validateApiKey, validateSchema } = require(Runtime.getAssets()['/utils.js'].path);

// Type declarions

//  Request data => includes payload/body and query params
type RequestData = {
  data?: string;
};

//Request Headers
type RequestHeaders = {
  'x-api-key'?: string
}

// If you want to use environment variables, you will need to type them like
type MyContext = {
  API_KEY?: string
};

// ----------------------------
// Main Function

export const handler: ServerlessFunctionSignature = async function (
  context: Context<MyContext>,
  event: ServerlessEventObject<RequestData, RequestHeaders>,
  callback: ServerlessCallback
) {

  try {
    validateApiKey({
      secretKey: context.API_KEY,
      requestKey: event.request.headers['x-api-key']
    })    
  } catch (error: unknown){
    const response = createErrorResponse({error: error, message: 'Unauthorized.', code: 401})
    return callback(null, response)
  }

  // define data schema
  const dataSchema = {
    teste: [
      {
        type: 'number',
        required: true
      }
    ]
  }

  const validatedData = validateSchema(dataSchema, event)  

  if(!validatedData.isValid) {
    const response = createErrorResponse({error: validatedData.errors, message: 'Invalid data.', code: 400})
    return callback(null, response)
  }
  
  const response: TwilioResponse = createResponse()
  response.setBody(validatedData.data)
  return callback(null, response);
};

// ----------------------------

