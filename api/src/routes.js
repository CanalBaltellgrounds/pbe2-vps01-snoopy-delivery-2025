const express = require('express');
const routes = express.Router();

const Motorista = require('./controllers/motorista');
const Pedido = require('./controllers/pedido');

// Rota inicial
routes.get('/', (req, res) => {
  return res.json({ 
    titulo: 'Snoppy PetShop - Sistema de Delivery',
    descricao: 'API para gerenciamento de motoristas e pedidos',
    rotas_disponiveis: [
      '/motorista',
      '/pedido'
    ]
  });
});

// Rotas para Motoristas
routes.post('/motorista', Motorista.create);
routes.get('/motorista', Motorista.read);
routes.get('/motorista/:id', Motorista.readOne); // Inclui pedidos do motorista [RF001.2]
routes.put('/motorista/:id', Motorista.update);
routes.delete('/motorista/:id', Motorista.remove);

// Rotas para Pedidos
routes.post('/pedido', Pedido.create); // Associa automaticamente ao motorista [RF002.1]
routes.get('/pedido', Pedido.read); // Retorna lista de pedidos e valor total [RF002.1]
routes.get('/pedido/:id', Pedido.readOne);
routes.put('/pedido/:id', Pedido.update);
routes.delete('/pedido/:id', Pedido.remove);

// Rotas adicionais específicas
routes.get('/motorista/:id/pedidos', Motorista.getPedidosByMotorista); // Alternativa para obter pedidos por motorista
routes.get('/pedido/total', Pedido.getTotalPedidos); // Rota específica para o valor total

module.exports = routes;