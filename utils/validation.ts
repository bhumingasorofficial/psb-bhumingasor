
import { formSchema, FormData, FormErrors } from '../types';

// Mapping fields to steps for partial validation
// Step 1: Survey
// Step 2: Student
// Step 3: Parent
// Step 4: Docs (Without Payment Proof)
// Step 5: Payment (Payment Proof only)
// Step 6: Review/Terms
const STEP_FIELDS: Record<number, Extract<keyof FormData, string>[]> = {
    1: ['infoSource'],
    2: ['schoolChoice', 'fullName', 'nik', 'birthPlace', 'birthDate', 'province', 'city', 'district', 'specificAddress', 'previousSchool', 'nisn', 'gender'],
    3: ['fatherName', 'fatherOccupation', 'fatherOccupationOther', 'motherName', 'motherOccupation', 'motherOccupationOther', 'parentWaNumber'],
    4: ['kartuKeluarga', 'aktaKelahiran', 'ktpWalimurid', 'pasFoto', 'ijazah'],
    5: ['buktiPembayaran'],
    6: ['termsAgreed'],
};

export const validateStep = (step: number, formData: FormData): { success: boolean, errors: FormErrors } => {
    const fieldsToValidate = STEP_FIELDS[step];
    if (!fieldsToValidate) {
        return { success: true, errors: {} };
    }

    const result = formSchema.safeParse(formData);

    if (result.success) {
        return { success: true, errors: {} };
    }

    const allFieldErrors = result.error.flatten().fieldErrors as FormErrors;
    const stepErrors: FormErrors = {};
    let hasStepErrors = false;

    for (const field of fieldsToValidate) {
        const error = allFieldErrors[field];
        if (error) {
            stepErrors[field] = error;
            hasStepErrors = true;
        }
    }
    
    if (hasStepErrors) {
        return { success: false, errors: stepErrors };
    }

    return { success: true, errors: {} };
};
