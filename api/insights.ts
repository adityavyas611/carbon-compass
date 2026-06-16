import { createPostHandler } from './_lib/createPostHandler.js';
import { handleInsightRequest } from './_lib/handlers.js';

export default createPostHandler(handleInsightRequest);
