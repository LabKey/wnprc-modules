export type StatusStates = | "In Progress" | "Review Required" | "Completed";

export type TaskValuesType = {
    taskid: { value: string, error: string };
    duedate: { value: Date, error: string };
    assignedto: { value: number, error: string };
    category: { value: string, error: string };
    title: { value: string, error: string };
    formtype: { value: string, error: string };
    qcstate: { value: string, error: string };
};