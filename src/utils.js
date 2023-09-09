export const formatErrorResponse = (error) => {
    return {
        message: error.message,
        code: error.extensions.code,
        extraAttributes:  error.extensions.extraAttributes
    }
}