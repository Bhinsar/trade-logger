import * as yup from "yup";

export const createStrategySchema = yup.object({
    title: yup.string().required("Title is required").min(1, "Title is required"),
    description: yup.string().required("Description is required").min(1, "Description is required"),
});

export type CreateStrategyInput = yup.InferType<typeof createStrategySchema>;