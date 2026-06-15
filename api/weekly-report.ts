import { createPostHandler } from './_lib/createPostHandler';
import { handleWeeklyReportRequest } from './_lib/handlers';

export default createPostHandler(handleWeeklyReportRequest);
