import {
    CreateCustomerDTO,
    CustomerResponse,
} from '../../dto/customer/create-customer.dto';

export interface ICreateCustomerUseCase {
    execute(dto: CreateCustomerDTO): Promise<CustomerResponse>;
}
