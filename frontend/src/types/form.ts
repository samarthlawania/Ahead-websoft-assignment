export type FieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'email'
    | 'date'
    | 'checkbox'
    | 'radio'
    | 'select'
    | 'file';

export interface FieldValidation {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
}

export interface FieldOption {
    value: string;
    label: string;
    nestedFields?: FormField[];
}

export interface FormField {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    required: boolean;
    options?: FieldOption[];
    validation?: FieldValidation;
    order: number;
}

export interface Form {
    _id?: string;
    id?: string;
    title: string;
    description: string;
    fields: FormField[];
    version?: number;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface FormSubmission {
    id: string;
    formId: string;
    data: Record<string, any>;
    submittedAt: Date;
}
