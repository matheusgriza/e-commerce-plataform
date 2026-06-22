import { Customer } from '../../domain/entities/customer.domain';
import {
    CreateCustomerDTO,
    CustomerResponse,
} from '../dto/customer/create-customer.dto';
import { ICreateCustomerUseCase } from '../ports/input/create-customer.port';
import { ICustomerRepository } from '../ports/output/customer.repository';

export class CreateCustomer implements ICreateCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) {}

    public async execute(dto: CreateCustomerDTO): Promise<CustomerResponse> {
        const customer = Customer.build(dto.name, 'active');

        await this.customerRepository.save(customer);

        return {
            id: customer.id,
            name: customer.name,
            status: customer.status,
            createdAt: customer.createdAt.toISOString(),
        };
    }
}
