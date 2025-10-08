USE usbtecnokcar;

-- Cria tabela de rotas
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_from VARCHAR(50) NOT NULL,
    route_to VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Popula tabela com dados iniciais
INSERT INTO routes (route_from, route_to, price) VALUES
('A', 'B', 23.00),
('B', 'C', 8.00),
('C', 'D', 15.50),
('D', 'E', 12.75),
('E', 'F', 30.00)
ON DUPLICATE KEY UPDATE price=VALUES(price);
