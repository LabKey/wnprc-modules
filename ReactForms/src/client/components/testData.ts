import checkbox from './Checkbox';

export type BloodRow = {
    key: string
    Id: string,
    date: Date,
    project: number,
    protocol: string,
    quantity: string,
    performedby: string,
    assayCode: string,
    billedby: string,
    tube_type: string,
    additionalServices: string,
    instructions: string,
    remark: string,
    QCState: string,
    taskid: string,
    requestid: string
};

export type UltrasoundsRow = {

    Id: string,
    pregnancyid: string,
    project: number,
    restraint: string,
    fetal_heartbeat: typeof checkbox,
    beats_per_minute: number,
    gest_sac_mm: number,
    gest_sac_gest_day: number,
    crown_rump_mm: number,
    crown_rump_gest_day: number,
    biparietal_diameter_mm: number,
    biparietal_diameter_gest_day: number,
    femur_length_mm: number,
    femur_length_gest_day: number,
    yolk_sac_diameter_mm: number,
    head_circumference_mm: number,
    code: string
    remark: string
    performedby: string
    followup_required: typeof checkbox
};