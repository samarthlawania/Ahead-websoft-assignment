import { Form } from '@/types/form';

export const mockForms: Form[] = [
    {
        id: '1',
        title: 'Customer Feedback Survey',
        description: 'Help us improve by sharing your experience',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        fields: [
            {
                id: 'f1',
                name: 'name',
                label: 'Your Name',
                type: 'text',
                required: true,
                order: 1,
                validation: { min: 2, max: 100 }
            },
            {
                id: 'f2',
                name: 'email',
                label: 'Email Address',
                type: 'email',
                required: true,
                order: 2
            },
            {
                id: 'f3',
                name: 'rating',
                label: 'How would you rate our service?',
                type: 'radio',
                required: true,
                order: 3,
                options: [
                    { value: 'excellent', label: 'Excellent' },
                    { value: 'good', label: 'Good' },
                    { value: 'average', label: 'Average' },
                    { value: 'poor', label: 'Poor' }
                ]
            },
            {
                id: 'f4',
                name: 'comments',
                label: 'Additional Comments',
                type: 'textarea',
                required: false,
                order: 4,
                validation: { max: 500 }
            }
        ]
    },
    {
        id: '2',
        title: 'Event Registration',
        description: 'Register for our upcoming workshop',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-05'),
        fields: [
            {
                id: 'f5',
                name: 'fullName',
                label: 'Full Name',
                type: 'text',
                required: true,
                order: 1
            },
            {
                id: 'f6',
                name: 'attendeeType',
                label: 'Attendee Type',
                type: 'select',
                required: true,
                order: 2,
                options: [
                    { value: 'student', label: 'Student' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'other', label: 'Other' }
                ]
            },
            {
                id: 'f7',
                name: 'dietaryRestrictions',
                label: 'Dietary Restrictions',
                type: 'checkbox',
                required: false,
                order: 3,
                options: [
                    { value: 'vegetarian', label: 'Vegetarian' },
                    { value: 'vegan', label: 'Vegan' },
                    { value: 'glutenFree', label: 'Gluten-Free' },
                    { value: 'none', label: 'None' }
                ]
            }
        ]
    }
];

let formsData = [...mockForms];

export const getForms = (): Form[] => {
    return formsData;
};

export const getFormById = (id: string): Form | undefined => {
    return formsData.find(form => form.id === id);
};

export const createForm = (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Form => {
    const newForm: Form = {
        ...form,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
    };
    formsData.push(newForm);
    return newForm;
};

export const updateForm = (id: string, updates: Partial<Form>): Form | undefined => {
    const index = formsData.findIndex(form => form.id === id);
    if (index !== -1) {
        formsData[index] = {
            ...formsData[index],
            ...updates,
            updatedAt: new Date()
        };
        return formsData[index];
    }
    return undefined;
};

export const deleteForm = (id: string): boolean => {
    const initialLength = formsData.length;
    formsData = formsData.filter(form => form.id !== id);
    return formsData.length < initialLength;
};
