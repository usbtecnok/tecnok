CREATE TABLE IF NOT EXISTS corridas_precos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rota VARCHAR(255) NOT NULL UNIQUE,
  preco DECIMAL(10,2) NOT NULL
);

INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Maracai/Tijuca/Mato Machado', 10.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Açude/Casa do Alto/Mansão Rosa', 12.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Agrícola/Valeriano/Furnas', 10.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Estrada Velha Montanha e Cedae', 20.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Floresta da Tijuca', 20.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Gávea Pna/Biguá', 15.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Gervásio S./Córrego A.', 10.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Rampa portão', 10.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Silva Aereal', 12.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Soberbo/Taquara do Alto', 15.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Violão', 15.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Vista Chinesa após cabine', 22.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Botafogo', 50.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Catete/Glória/Leme', 55.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Copacabana', 55.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Favelinha/Icanoas', 35.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Flamengo/Vívo rio/Lgo Machado', 55.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Gávea/Leblon', 45.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Humaitá', 45.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Ipanema', 50.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Jardim Botânico', 42.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Laranjeiras/Cosme Velho', 42.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - São Conrado', 35.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Urca/Marina da Glória', 60.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Aeroporto Galeão', 85.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Aeroportos Santos Dumont', 75.0);
INSERT INTO corridas_precos (rota, preco) VALUES ('Alto - Rodoviária Novo Rio', 50.0);