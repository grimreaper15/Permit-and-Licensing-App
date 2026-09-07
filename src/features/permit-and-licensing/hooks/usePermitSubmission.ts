import { useState } from 'react';
import { submitPermitApplication } from '../api/permitApi';
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

  const submit = async (): Promise<PermitSubmitResult | null> => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return null;
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
      return result;
    } catch (err: any) {
      const msg = err.message || 'Failed to submit permit application to server.';
      setError(msg);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setFormState(INITIAL_FORM_STATE);
    setIsSubmitting(false);
    setError(null);
    setSubmitResult(null);
  };

  return {
    formState,
    updateField,
    isSubmitting,
    error,
    submitResult,
    submit,
    reset,
  };
}
