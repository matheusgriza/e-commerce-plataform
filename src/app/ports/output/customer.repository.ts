import { Customer } from '../../../domain/entities/customer.domain';

export interface ICustomerRepository {
    findById(id: string): Promise<Customer | null>;
    findAll(): Promise<Customer[] | null>;
    save(customer: Customer): Promise<void>;
    update(customer: Customer): Promise<void>;
}
