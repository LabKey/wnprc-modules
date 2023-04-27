export type StatusStates = | "In Progress" | "Review Required" | "Completed";

export type TaskValuesType = {
    taskId: { value: string, error: string };
    taskDueDate: { value: Date, error: string };
    taskAssignedTo: { value: number, error: string };
    taskCategory: { value: string, error: string };
    taskTitle: { value: string, error: string };
    taskFormType: { value: string, error: string };
    taskQCStateLabel: { value: string, error: string };
};