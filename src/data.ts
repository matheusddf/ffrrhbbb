import { Category, Product, StoreConfig } from './types';

export const storeConfig: StoreConfig = {
  name: "Burger do Gordo",
  logo: "https://picsum.photos/seed/burger-logo/400/400",
  banner: "https://picsum.photos/seed/burger-banner/1200/400",
  whatsappNumber: "5511999999999",
  address: "Rua dos Burgers, 123",
  location: "Timon - MA",
  deliveryFee: 5.00,
  minOrder: 20.00,
  openHours: "Fechado • Abrimos às 18h00",
  isOpen: false,
  allowOrdersWhenClosed: true,
  freeDeliveryOver: 100.00,
  neighborhoods: [
    { id: '1', name: 'Bairro Primavera', fee: 5.60 },
    { id: '2', name: 'Bairro Mangueira', fee: 10.00 },
    { id: '3', name: 'Centro', fee: 3.00 },
  ],
  loyalty: {
    enabled: true,
    pointsPerReal: 1,
    welcomeBonus: 10,
    rewards: [
      { id: 'r1', name: 'Burguinho Grátis', pointsNeeded: 100, productId: '6' },
      { id: 'r2', name: 'Combo Casalzinho', pointsNeeded: 250, productId: '7' },
    ]
  },
  tabImages: {
    inicio: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1200",
    promos: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200",
    pedidos: "https://images.unsplash.com/photo-1526367790999-0150786486a9?auto=format&fit=crop&q=80&w=1200",
    perfil: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=1200"
  }
};

export const categories: Category[] = [
  { id: 'hamburgers', name: "Hamburguer's", icon: 'Beef' },
  { id: 'combos', name: 'Combos no precinho', icon: 'Tag' },
  { id: 'entradas', name: 'Entradas', icon: 'Utensils' },
  { id: 'milkshake', name: 'Milkshake', icon: 'IceCream' },
  { id: 'bebidas', name: 'Bebidas', icon: 'CupSoda' },
];

export const products: Product[] = [
  {
    id: '1',
    categoryId: 'hamburgers',
    name: 'Gordelícia',
    description: 'Experimente nosso irresistível pão de batata, acompanhado por uma maionese artesanal exclusiva! Com um suculento...',
    price: 28.00,
    image: 'https://picsum.photos/seed/burger-gordelicia/400/300',
    available: true,
    badge: 'MAIS PEDIDO',
    optionGroups: [
      {
        id: 'g1',
        name: 'Escolha o ponto da carne',
        required: true,
        min: 1,
        max: 1,
        options: [
          { id: 'o1', name: 'Mal passado' },
          { id: 'o2', name: 'Ao ponto' },
          { id: 'o3', name: 'Bem passado' }
        ]
      },
      {
        id: 'g2',
        name: 'Adicionais',
        required: false,
        min: 0,
        max: 5,
        options: [
          { id: 'o4', name: 'Bacon extra', price: 4.50 },
          { id: 'o5', name: 'Queijo extra', price: 3.00 },
          { id: 'o6', name: 'Ovo frito', price: 2.50 }
        ]
      }
    ]
  },
  {
    id: '2',
    categoryId: 'hamburgers',
    name: 'Telecate',
    description: 'Pão de batata, blend 150g na churrasqueira, queijo coalho, redução de cajuína, charque desfiado e maionese de...',
    price: 37.00,
    image: 'https://picsum.photos/seed/burger-telecate/400/300',
    available: true,
  },
  {
    id: '3',
    categoryId: 'hamburgers',
    name: 'Gordo apertadinho',
    description: 'Delicie-se com nosso irresistível burger prensado na chapa! Feito com pão...',
    price: 29.00,
    image: 'https://picsum.photos/seed/burger-apertadinho/400/300',
    available: true,
  },
  {
    id: '4',
    categoryId: 'hamburgers',
    name: 'Só pra clarear as ideias',
    description: 'Pão de batata, blend 200g na churrasqueira com mussarela, cebola assada, picles, bacon e maionese',
    price: 30.00,
    image: 'https://picsum.photos/seed/burger-clarear/400/300',
    available: true,
    badge: 'RECOMENDADO'
  },
  {
    id: '5',
    categoryId: 'hamburgers',
    name: 'PCQ',
    description: 'Hambúrguer pra você comer sem culpa. Somente pão, carne e queijo',
    price: 25.00,
    image: 'https://picsum.photos/seed/burger-pcq/400/300',
    available: true,
    badge: 'NOVIDADE'
  },
  {
    id: '6',
    categoryId: 'combos',
    name: 'Combo burguinho | Burguinho + Batata + Refri lata',
    description: 'Burguinho (pão de batata, maionese da casa, alface, tomate, cebola roxa e blend smash com mussarela) batata simples e 1...',
    price: 35.00,
    oldPrice: 39.00,
    image: 'https://picsum.photos/seed/combo-burguinho/400/300',
    available: true,
  },
  {
    id: '7',
    categoryId: 'combos',
    name: 'Combo casalzinho | 2 Burguinho + batata simples + 2 refri lata',
    description: 'Pra você dividir com a amada, ou pra comer por você e ela! 2 Burguinho 1 Batata P 2 refri lata',
    price: 56.00,
    oldPrice: 59.00,
    image: 'https://picsum.photos/seed/combo-casalzinho/400/300',
    available: true,
  },
  {
    id: '8',
    categoryId: 'entradas',
    name: 'Coxinha sem massa meia porção',
    description: 'Meia porção de coxinha sem massa 3 unidades',
    price: 15.00,
    image: 'https://picsum.photos/seed/coxinha1/400/300',
    available: true,
    badge: 'NOVIDADE'
  },
  {
    id: '9',
    categoryId: 'entradas',
    name: 'Coxinha sem massa',
    description: 'Experimente nossa irresistível porção de 6 coxinhas recheadas, crocantes e suculentas, servidas com maionese...',
    price: 25.00,
    image: 'https://picsum.photos/seed/coxinha2/400/300',
    available: true,
  },
  {
    id: '10',
    categoryId: 'milkshake',
    name: 'Milk shake de ovo maltine com creme de avelã',
    description: 'Delicioso milk shake sabor ovo maltine crocante e creme de avelã',
    price: 23.00,
    image: 'https://picsum.photos/seed/milkshake1/400/300',
    available: true,
  },
  {
    id: '11',
    categoryId: 'bebidas',
    name: 'Guaraná',
    description: 'Lata 350ml',
    price: 7.00,
    image: 'https://picsum.photos/seed/guarana/400/300',
    available: true,
  },
];
