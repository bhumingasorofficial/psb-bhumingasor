
import { formSchema, FormData, FormErrors } from '../types';

// Mapping fields to steps for partial validation
// Step 1: Survey
// Step 2: Student Identity, Address, Periodic Data
// Step 3: Parents & Guardian
// Step 4: Documents
// Step 5: Payment
// Step 6: Terms

const STEP_FIELDS: Record<number, Extract<keyof FormData, string>[]> = {
    1: ['infoSource'],
    
    // Step 2 includes Identitas, Alamat, Kontak, Data Periodik
    2: [
        'schoolChoice', 'smkMajor', 
        'fullName', 'gender', 'nik', 'nisn', 'birthPlace', 'birthDate', 'previousSchool',
        'province', 'city', 'district', 'village', 'specificAddress', 'rt', 'rw', 'postalCode',
        'parentWaNumber', // Kontak dipindah ke sini
        'height', 'weight', 'siblingCount', 'childOrder'
    ],
    
    // Step 3 includes Ayah, Ibu, Wali
    3: [
        'fatherName', 'fatherEducation', 'fatherOccupation', 'fatherOccupationOther', 'fatherIncome',
        'motherName', 'motherEducation', 'motherOccupation', 'motherOccupationOther', 'motherIncome',
        'hasGuardian', 'guardianName', 'guardianEducation', 'guardianOccupation', 'guardianOccupationOther', 'guardianIncome'
    ],
    
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
