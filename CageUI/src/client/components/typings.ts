export interface Cage {
    id: number
    name: string;
}

export interface Rack {
    id: number
    cages: Cage[]
}