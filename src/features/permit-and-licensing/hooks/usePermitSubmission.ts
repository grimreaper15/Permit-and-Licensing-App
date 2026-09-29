import { useRef, useState } from 'react';
import { setupApplicantProfile, submitPermitApplication } from '../api/permitApi';
import { OwnershipType, PermitSubmitPayload, PermitSubmitResult } from '../types/permit.types';

export interface PermitFormState {
  permit_type: string;
  business_name: string;
  business_address: string;
  line_of_business: string;
  capital_investment: string;
  gross_sales: string;
  number_of_employees: string;
  floor_area_sqm: string;
  ownership_type: OwnershipType;
}

const INITIAL_FORM_STATE: PermitFormState = {
  permit_type: 'Business Permit',
  business_name: '',
  business_address: '',
  line_of_business: 'General Merchandise',
  capital_investment: '',
  gross_sales: '',
  number_of_employees: '1',
  floor_area_sqm: '',
  ownership_type: 'Sole Proprietorship',
};

export function usePermitSubmission() {
  const [formState, setFormState] = useState<PermitFormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<PermitSubmitResult | null>(null);

  // Phase 2B Profile Setup State
  const [profileRequired, setProfileRequired] = useState(false);
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);
  const [profileSetupError, setProfileSetupError] = useState<string | null>(null);

  // Retry counter to strictly limit automatic retries to 1
  const retryCountRef = useRef<number>(0);

  const updateField = <K extends keyof PermitFormState>(field: K, value: PermitFormState[K]) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formState.business_name.trim()) {
      return 'Please enter the Business Name.';
    }
    if (!formState.business_address.trim()) {
      return 'Please enter the Business Address.';
    }
    if (!formState.line_of_business.trim()) {
      return 'Please enter the Line of Business.';
    }
    return null;
  };

  const submit = async (isRetry = false): Promise<PermitSubmitResult | null> => {
    if (isSubmitting || isSettingUpProfile) {
      return null;
    }

    if (!isRetry) {
      retryCountRef.current = 0;
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return null;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: PermitSubmitPayload = {
        permit_type: formState.permit_type,
        business_name: formState.business_name.trim(),
        business_address: formState.business_address.trim(),
        line_of_business: formState.line_of_business.trim(),
        capital_investment: parseFloat(formState.capital_investment) || 0,
        gross_sales: parseFloat(formState.gross_sales) || 0,
        number_of_employees: parseInt(formState.number_of_employees, 10) || 1,
        floor_area_sqm: parseFloat(formState.floor_area_sqm) || 0,
        ownership_type: formState.ownership_type,
      };

      const result = await submitPermitApplication(payload);
      setSubmitResult(result);
      setProfileRequired(false);
      return result;
    } catch (err: any) {
      const isStatus422 = err?.status === 422 || err?.statusCode === 422;
      const hasProfileRequired =
        err?.data?.profile_required === true ||
        err?.rawResponse?.data?.profile_required === true;

      // Detect HTTP 422 AND data.profile_required === true
      if (isStatus422 && hasProfileRequired) {
        if (isRetry || retryCountRef.current >= 1) {
          // Automatic retry already occurred once; do NOT loop indefinitely
          setProfileRequired(false);
          setError(
            err.message ||
              'Applicant profile setup is required, but automatic retry could not complete. Please tap Submit Application to try again.'
          );
          return null;
        }

        // Distinct state: do NOT render generic submission error
        setProfileRequired(true);
        setError(null);
        return null;
      }

      // Normal error path (401, 403, 422 without profile_required, 500, network error)
      setProfileRequired(false);
      const msg = err.message || 'Failed to submit permit application to server.';
      setError(msg);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Completes applicant profile setup by sending residential address,
   * then automatically retries the original permit submission once.
   */
  const setupProfileAndRetry = async (address: string): Promise<PermitSubmitResult | null> => {
    const trimmed = address.trim();

    if (!trimmed) {
      setProfileSetupError('Residential address is required.');
      return null;
    }
    if (trimmed.length < 5) {
      setProfileSetupError('Residential address must be at least 5 characters.');
      return null;
    }
    if (trimmed.length > 500) {
      setProfileSetupError('Residential address cannot exceed 500 characters.');
      return null;
    }

    if (isSettingUpProfile || isSubmitting) {
      return null;
    }

    setIsSettingUpProfile(true);
    setProfileSetupError(null);

    try {
      const response = await setupApplicantProfile(trimmed);

      // Successful first-time creation (HTTP 201) or existing profile ready (HTTP 200)
      if (response.success || response.data?.profile_required === false) {
        setProfileRequired(false);
        setProfileSetupError(null);
        setIsSettingUpProfile(false);

        // Automatically retry original permit submission once
        retryCountRef.current = 1;
        return await submit(true);
      } else {
        setProfileSetupError(response.message || 'Unable to complete applicant profile setup.');
        return null;
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to complete applicant profile setup.';
      setProfileSetupError(msg);
      return null;
    } finally {
      setIsSettingUpProfile(false);
    }
  };

  const cancelProfileSetup = () => {
    setProfileRequired(false);
    setProfileSetupError(null);
  };

  const clearProfileSetupError = () => {
    setProfileSetupError(null);
  };

  const reset = () => {
    setFormState(INITIAL_FORM_STATE);
    setIsSubmitting(false);
    setIsSettingUpProfile(false);
    setProfileRequired(false);
    setError(null);
    setProfileSetupError(null);
    setSubmitResult(null);
    retryCountRef.current = 0;
  };

  return {
    formState,
    updateField,
    isSubmitting,
    error,
    submitResult,
    submit,
    profileRequired,
    isSettingUpProfile,
    profileSetupError,
    setupProfileAndRetry,
    cancelProfileSetup,
    clearProfileSetupError,
    reset,
  };
}
