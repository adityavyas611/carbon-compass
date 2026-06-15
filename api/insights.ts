import { createPostHandler } from './_lib/createPostHandler';
import { handleInsightRequest } from './_lib/handlers';

export default createPostHandler(handleInsightRequest);
