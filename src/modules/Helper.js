export const checkInputBeforeSqlQuery = (arg) => {
    if (typeof arg != "string" || arg == null)
        return;
    arg = arg.replace("'", "''");

    return arg;
}

export const createErrorMessage = (message) => {
    return { "Error":{"details" : [{"message": message}]}}
}