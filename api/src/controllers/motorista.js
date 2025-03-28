const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper para manipular lista de telefones
const telefoneHelper = {
  serialize: (telefones) => telefones ? telefones.join(';') : null,
  deserialize: (telefonesStr) => telefonesStr ? telefonesStr.split(';') : []
};

module.exports = {
  // [RF001] Criar motorista
  async create(req, res) {
    try {
      const { email, nome, telefones } = req.body;
      
      const motorista = await prisma.motorista.create({
        data: {
          email,
          nome,
          telefones: telefoneHelper.serialize(telefones) // [RF001.1]
        }
      });
      
      return res.status(201).json({
        ...motorista,
        telefones: telefoneHelper.deserialize(motorista.telefones)
      });
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao criar motorista' });
    }
  },

  // [RF001] Listar todos motoristas
  async read(req, res) {
    try {
      const motoristas = await prisma.motorista.findMany();
      
      // Desserializa telefones para cada motorista
      const result = motoristas.map(m => ({
        ...m,
        telefones: telefoneHelper.deserialize(m.telefones)
      }));
      
      return res.json(result);
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao buscar motoristas' });
    }
  },

  // [RF001.2] Obter motorista específico com seus pedidos
  async readOne(req, res) {
    try {
      const { id } = req.params;
      
      const motorista = await prisma.motorista.findUnique({
        where: { id: parseInt(id) },
        include: { pedidos: true }
      });
      
      if (!motorista) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }
      
      return res.json({
        ...motorista,
        telefones: telefoneHelper.deserialize(motorista.telefones),
        totalPedidos: motorista.pedidos.length,
        valorTotalPedidos: motorista.pedidos.reduce((sum, p) => sum + p.valor, 0)
      });
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao buscar motorista' });
    }
  },

  // [RF001] Atualizar motorista
  async update(req, res) {
    try {
      const { id } = req.params;
      const { email, nome, telefones } = req.body;
      
      const motorista = await prisma.motorista.update({
        where: { id: parseInt(id) },
        data: {
          email,
          nome,
          telefones: telefoneHelper.serialize(telefones)
        }
      });
      
      return res.json({
        ...motorista,
        telefones: telefoneHelper.deserialize(motorista.telefones)
      });
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao atualizar motorista' });
    }
  },

  // [RF001] Remover motorista
  async remove(req, res) {
    try {
      const { id } = req.params;
      
      // Verifica se existem pedidos associados
      const pedidos = await prisma.pedido.findMany({
        where: { motoristaId: parseInt(id) }
      });
      
      if (pedidos.length > 0) {
        return res.status(400).json({ 
          error: 'Não é possível remover motorista com pedidos associados' 
        });
      }
      
      await prisma.motorista.delete({
        where: { id: parseInt(id) }
      });
      
      return res.status(204).send();
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao remover motorista' });
    }
  },

  // Rota adicional: Pedidos por motorista
  async getPedidosByMotorista(req, res) {
    try {
      const { id } = req.params;
      
      const pedidos = await prisma.pedido.findMany({
        where: { motoristaId: parseInt(id) }
      });
      
      return res.json(pedidos);
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: 'Falha ao buscar pedidos' });
    }
  }
};