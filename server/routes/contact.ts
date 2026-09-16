import { inquiryRouter } from './inquiries.ts';

// Re-export inquiryRouter as contactRouter to support both /api/contact and /api/inquiries
export const contactRouter = inquiryRouter;
