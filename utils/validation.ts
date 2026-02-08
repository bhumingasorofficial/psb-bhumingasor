
import { formSchema, FormData, FormErrors } from '../types';

// Validasi untuk Full Form Mode (setelah Login)
// Note: Step 1 (Survey) diisi otomatis dari backend saat login, jadi tidak perlu validasi input user.
// Step sequence in UI:
// 1. Data Siswa (A,B,C,F)
// 2. Data Ortu (E)
// 3. Dokumen
// 4. Review & Submit

const STEP_FIELDS: Record<number, Extract<keyof FormData, string>[]> = {
    // Step 1: Student Data
    1: [
        'schoolChoice', 'smkMajor', 
        'nisn', 'birthPlace', 'birthDate', 'previousSchool',
        'province', 'city', 'district', 'village', 'specificAddress', 'rt', 'rw', 'postalCode',
        'parentWaNumber', 'height', 'weight', 'siblingCount', 'childOrder'
    ],
    
    // Step 2: Parents
    2: [
        'fatherName', 'fatherEducation', 'fatherOccupation', 'fatherOccupationOther', 'fatherIncome',
        'motherName', 'motherEducation', 'motherOccupation', 'motherOccupationOther', 'motherIncome',
        'hasGuardian', 'guardianName', 'guardianEducation', 'guardianOccupation', 'guardianOccupationOther', 'guardianIncome'
    ],
    
    // Step 3: Documents
    3: ['kartuKeluarga', 'aktaKelahiran', 'ktpWalimurid', 'pasFoto', 'ijazah'],
    
    // Step 4: Final
    4: ['finalAgreement'],
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
