/**
 * Permit & Licensing TypeScript Data Models
 * Authoritative types matching the Civentral Webhost JSON responses.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  status: 'success' | 'error' | string;
  message: string;
  data: T;
}

export type PermitApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'document_screening'
  | 'pending_requirements'
  | 'inspection_pending'
  | 'inspection_passed'
  | 'fee_assessment'
  | 'pending_payment'
  | 'payment_verified'
  | 'final_approval'
  | 'approved'
  | 'issued'
  | 'rejected'
  | 'cancelled'
  | string;

export interface PermitApplication {
  permit_id?: number | string;
  id?: number | string;
  application_no: string;
  permit_type?: string;
  type?: string;
  business_name?: string;
  line_of_business?: string;
  owner_name?: string;
  status: PermitApplicationStatus;
  current_status?: PermitApplicationStatus;
  approval_status?: string;
  payment_status?: string;
  issuance_status?: string;
  created_at?: string;
  updated_at?: string;
  date_applied?: string;
}

export type TimelineStageStatus =
  | 'completed'
  | 'current'
  | 'pending'
  | 'needs_action'
  | 'rejected'
  | 'ready_for_release'
  | string;

export interface PermitTimelineStage {
  stage_id?: string | number;
  stage_number?: number;
  stage_name: string;
  name?: string;
  title?: string;
  status: TimelineStageStatus;
  timestamp?: string;
  updated_at?: string;
  description?: string;
  remarks?: string;
}

export interface PermitFeeItem {
  fee_name: string;
  name?: string;
  amount: number | string;
  description?: string;
}

export interface PermitPaymentSummary {
  assessment_status?: string;
  payment_status?: 'unpaid' | 'pending' | 'verified' | 'failed' | string;
  is_paid?: boolean;
  total_amount?: number | string;
  total_paid?: number | string;
  balance?: number | string;
  or_number?: string;
  payment_date?: string;
  payment_method?: string;
  fees?: PermitFeeItem[];
}

export interface PermitDeficiency {
  deficiency_id?: number | string;
  id?: number | string;
  type?: string;
  title?: string;
  description: string;
  status?: 'open' | 'resolved' | 'pending' | string;
  created_at?: string;
  resolved_at?: string;
}

export interface PermitDocumentSummary {
  requirement_id?: number | string;
  id?: number | string;
  name?: string;
  document_name?: string;
  file_path?: string;
  file_name?: string;
  status?: 'pending' | 'approved' | 'rejected' | string;
  uploaded_at?: string;
  screening_result?: {
    verified?: boolean;
    confidence?: number;
    notes?: string;
  };
}

export interface PermitInspectionSummary {
  inspection_id?: number | string;
  status?: 'scheduled' | 'passed' | 'failed' | 'pending' | string;
  inspection_date?: string;
  scheduled_date?: string;
  inspector_name?: string;
  remarks?: string;
}

export interface PermitIssuance {
  permit_number?: string;
  issued_at?: string;
  valid_until?: string;
  expiry_date?: string;
  qr_code?: string;
  qr_hash?: string;
  status?: string;
}

export interface PermitDocumentSummary {
  requirement_id?: number | string;
  id?: number | string;
  name?: string;
  document_name?: string;
  file_path?: string;
  file_name?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'Pending' | 'Approved' | 'Rejected' | string;
  screening_status?: string;
  rejection_reason?: string | null;
  uploaded_at?: string;
  verified_at?: string;
  screening_result?: {
    verified?: boolean;
    confidence?: number;
    notes?: string;
  };
}

export interface PermitTrackingResponse {
  application_no: string;
  permit_id?: number | string;
  id?: number | string;
  permit_type?: string;
  business_name?: string;
  business_address?: string;
  owner_name?: string;
  status: PermitApplicationStatus;
  current_status?: PermitApplicationStatus;
  approval_status?: string;
  payment_status?: string;
  issuance_status?: string;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  last_updated?: string;
  timeline?: PermitTimelineStage[];
  payment?: PermitPaymentSummary;
  deficiencies?: PermitDeficiency[];
  documents?: PermitDocumentSummary[];
  inspection?: PermitInspectionSummary;
  issuance?: PermitIssuance;
}

// -----------------------------------------------------------------------------
// Sprint 2: Application Intake & Document Upload Types
// -----------------------------------------------------------------------------

export type OwnershipType =
  | 'Sole Proprietorship'
  | 'Partnership'
  | 'Corporation'
  | 'Cooperative';

export interface PermitSubmitPayload {
  permit_type?: string;
  business_name: string;
  business_address: string;
  line_of_business?: string;
  capital_investment?: number;
  gross_sales?: number;
  number_of_employees?: number;
  floor_area_sqm?: number;
  ownership_type?: OwnershipType;
}

export interface PermitSubmitResult {
  permit_id: number;
  application_no: string;
  permit_type: string;
  business_name: string;
  status: string;
  submitted_at: string;
}

export interface AiMismatchItem {
  field?: string;
  issue?: string;
  expected?: string;
  found?: string;
  [key: string]: any;
}

export interface AiScreeningData {
  badge_status?: 'Verified - High Confidence' | 'Needs Review - Discrepancy Found' | 'Deficient - Expired/Blurry' | string;
  quality_score?: number;
  is_legible?: number | boolean;
  is_expired?: number | boolean;
  ai_confidence?: number;
  mismatches?: AiMismatchItem[];
  extracted_data?: Record<string, any>;
}

export interface PermitUploadResult {
  document_id: number;
  permit_id: number;
  requirement_id: string;
  document_name: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  upload_status: 'completed' | 'pending' | 'failed' | string;
  ocr_status: 'completed' | 'pending' | 'failed' | 'skipped' | string;
  screening_status: 'completed' | 'pending' | 'failed' | string;
  screening?: AiScreeningData | null;
}

