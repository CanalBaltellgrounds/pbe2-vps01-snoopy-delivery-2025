const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  // [RF002] Criar pedido (associa a motorista) [RF002.1]
  async create(req, res) {
    try {
      const { data, valor, produto, endereco, numero, complemento, cep, motoristaId } = req.body;
      
      // Verifica se motorista existe
      const motorista = await prisma.motorista.findUnique({
        where: { id: motoristaId }
      });
      
      if (!motorista) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }
      
      const pedido = await prisma.pedido.create({
        data: {
          data: data ? new Date(data) : new Date(),
          valor,
          produto,
          endereco,
          numero,
          complemento,
          cep,
          motoristaId
        }
      });
      
      return res.status(201).json(pedido);
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao criar pedido' });
    }
  },

  // [RF002] Listar todos pedidos com valor total [RF002.1]
  async read(req, res) {
    try {
      const pedidos = await prisma.pedido.findMany({
        include: { motorista: true }
      });
      
      const total = pedidos.reduce((sum, pedido) => sum + pedido.valor, 0);
      
      return res.json({
        pedidos,
        total,
        count: pedidos.length
      });
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao buscar pedidos' });
    }
  },

  // [RF002] Obter pedido específico
  async readOne(req, res) {
    try {
      const { id } = req.params;
      
      const pedido = await prisma.pedido.findUnique({
        where: { id: parseInt(id) },
        include: { motorista: true }
      });
      
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      return res.json(pedido);
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao buscar pedido' });
    }
  },

  // [RF002] Atualizar pedido
  async update(req, res) {
    try {
      const { id } = req.params;
      const { data, valor, produto, endereco, numero, complemento, cep, motoristaId } = req.body;
      
      // Verifica se motorista existe se for atualizado
      if (motoristaId) {
        const motorista = await prisma.motorista.findUnique({
          where: { id: motoristaId }
        });
        
        if (!motorista) {
          return res.status(404).json({ error: 'Motorista não encontrado' });
        }
      }
      
      const pedido = await prisma.pedido.update({
        where: { id: parseInt(id) },
        data: {
          data: data ? new Date(data) : undefined,
          valor,
          produto,
          endereco,
          numero,
          complemento,
          cep,
          motoristaId
        },
        include: { motorista: true }
      });
      
      return res.json(pedido);
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao atualizar pedido' });
    }
  },

  // [RF002] Remover pedido
  async remove(req, res) {
    try {
      const { id } = req.params;
      
      await prisma.pedido.delete({
        where: { id: parseInt(id) }
      });
      
      return res.status(204).send();
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao remover pedido' });
    }
  },

  // Rota adicional: Valor total de todos pedidos
  async getTotalPedidos(req, res) {
    try {
      const aggregate = await prisma.pedido.aggregate({
        _sum: {
          valor: true
        },
        _count: {
          id: true
        }
      });
      
      return res.json({
        total: aggregate._sum.valor || 0,
        count: aggregate._count.id
      });
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao calcular total' });
    }
  }
};