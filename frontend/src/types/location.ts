export interface Department {
    id: number;
    name: string;
    code: string;
}

export interface City {
    id: number;
    department_id: number;
    name: string;
    code: string;
}
