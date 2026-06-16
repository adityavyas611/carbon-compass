import { createPostHandler } from './_lib/createPostHandler.js';
import { handleWeeklyReportRequest } from './_lib/handlers.js';

export default createPostHandler(handleWeeklyReportRequest);
