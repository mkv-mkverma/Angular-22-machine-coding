import { Component } from '@angular/core';

export interface Order {
  id: number;
  customer: {
    name: string;
  };
}

export interface OrderResponse{
  data:Order[]
}

@Component({
  selector: 'app-global-error-component',
  imports: [],
  templateUrl: './global-error-component.html',
  styleUrl: './global-error-component.scss',
})
export class GlobalErrorComponent {

  // API response 
  // ordersResponse: OrderResponse={
  //   data:[{
  //     id:1,
  //     customer:{
  //       name:'Manish'
  //     }
  //   }]
  // }

  // not API has changed the response 
  ordersResponse = JSON.parse(`
{
  "result": [
    {
      "id": 1,
      "customer": {
        "name": "John"
      }
    }
  ]
}
`);

  getFirstOrder(): string{
    return this.ordersResponse.data[0].customer.name
  }
}
