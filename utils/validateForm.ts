import { NextResponse } from "next/server";
import joi from "joi";

const validateForm = (form: object, schema: joi.ObjectSchema) => {
    const { value, error } = schema.validate(form);
    if (error) {
        return NextResponse.json(
            { error: error.details[0].message },
            { status: 400 }
        );
    }
    return value;
}

export default validateForm;