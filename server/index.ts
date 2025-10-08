import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Dados simulados de motoristas e passageiros
let motoristas = [
  {id:1,nome:'Motorista 1',lat:-22.9121,lon:-43.2300},
  {id:2,nome:'Motorista 2',lat:-22.9500,lon:-43.2100},
  {id:3,nome:'Motorista 3',lat:-22.8900,lon:-43.2600}
];

let passageiros = [
  {id:1,nome:'Passageiro 1',lat:-22.9300,lon:-43.2000},
  {id:2,nome:'Passageiro 2',lat:-22.9100,lon:-43.2500}
];

// Atualiza posição simulada a cada 3 segundos
setInterval(()=>{
  motoristas.forEach(m=>{
    m.lat += (Math.random()-0.5)/1000;
    m.lon += (Math.random()-0.5)/1000;
  });
  passageiros.forEach(p=>{
    p.lat += (Math.random()-0.5)/2000;
    p.lon += (Math.random()-0.5)/2000;
  });
},3000);

// Rota para obter dados
app.get('/api/dados',(req,res)=>{
  res.json({motoristas,passageiros});
});

// Rota para pedir corrida (simulado)
app.post('/api/pedir-corrida',(req,res)=>{
  const {usuarioId, destinoLat, destinoLon} = req.body;
  console.log('Pedido de corrida:', usuarioId, destinoLat, destinoLon);
  res.json({status:'ok', message:'Corrida registrada!'});
});

app.listen(PORT,()=>{
  console.log(`Backend Tecnok rodando na porta ${PORT}`);
});

// Importa e usa a rota de corridas com preço fixo
import corridasRouter from './rotasCorridas.js';
app.use('/api', corridasRouter);
