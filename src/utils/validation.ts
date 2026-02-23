import type { Question } from '../types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    data: Question[];
}

export const validateQuestionsJSON = (data: any): ValidationResult => {
    const errors: string[] = [];
    const validated: Question[] = [];

    if (!Array.isArray(data)) {
        errors.push('Input must be a top-level JSON array of questions.');
        return { isValid: false, errors, data: [] };
    }
    if (data.length === 0) {
        errors.push('No questions found in the array. The array is empty.');
        return { isValid: false, errors, data: [] };
    }

    data.forEach((item, index) => {
        // If the item itself is not a valid object, we can't check its properties.
        // Add an error and skip further validation for this specific item.
        if (!item || typeof item !== 'object') {
            errors.push(`Item at index ${index} is not a valid object.`);
            return; // Skip further checks for this item
        }

        // Auto-generate ID if missing
        if (!item.id) {
            item.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString();
        } else if (typeof item.id !== 'string') {
            errors.push(`Question at index ${index} 'id' must be a string if provided.`);
        }

        if (typeof item.question !== 'string') {
            errors.push(`Question at index ${index} must have a string 'question'.`);
        }
        if (item.background_knowledge !== undefined && typeof item.background_knowledge !== 'string') {
            errors.push(`Question at index ${index} 'background_knowledge' must be a string if provided.`);
        }
        if (item.explanation !== undefined && typeof item.explanation !== 'string') {
            errors.push(`Question at index ${index} 'explanation' must be a string if provided.`);
        }

        // Validate choices array and its contents
        if (!Array.isArray(item.choices)) {
            errors.push(`Question at index ${index} must have a 'choices' array.`);
        } else {
            let hasCorrectChoice = false;
            item.choices.forEach((choice: any, cIndex: number) => {
                // If the choice itself is not a valid object, skip its property checks.
                if (!choice || typeof choice !== 'object') {
                    errors.push(`Choice ${cIndex} in question ${index} is not a valid object.`);
                    return;
                }
                if (typeof choice.text !== 'string') {
                    errors.push(`Choice ${cIndex} in question ${index} must have a string 'text'.`);
                }
                if (choice.explanation !== undefined && typeof choice.explanation !== 'string') {
                    errors.push(`Choice ${cIndex} in question ${index} 'explanation' must be a string if provided.`);
                }
                if (choice.is_correct === undefined) {
                    choice.is_correct = false; // default to false
                } else if (typeof choice.is_correct !== 'boolean') {
                    errors.push(`Choice ${cIndex} in question ${index} 'is_correct' must be a boolean.`);
                }
                if (choice.is_correct) {
                    hasCorrectChoice = true;
                }
            });
            if (!hasCorrectChoice) {
                errors.push(`Question at index ${index} must have at least one choice where 'is_correct' is true.`);
            }
        }

        // If an item passes all checks up to this point, add it to validated.
        // Note: If there are errors for this item, it will still be pushed to `validated`
        // but the final `data` in the return object will be empty if `errors.length > 0`.
        validated.push(item as Question);
    });

    return {
        isValid: errors.length === 0,
        errors,
        data: errors.length === 0 ? validated : []
    };
};
