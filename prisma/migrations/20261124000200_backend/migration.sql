-- AlterTable
ALTER TABLE `historico` ADD COLUMN `envioId` CHAR(36) NULL;

-- CreateTable
CREATE TABLE `sessao` (
    `tokenHash` CHAR(64) NOT NULL,
    `expiraEm` DATETIME(3) NOT NULL,
    `usuarioId` INTEGER NOT NULL,

    INDEX `sessao_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`tokenHash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `historico_usuarioId_envioId_key` ON `historico`(`usuarioId`, `envioId`);

-- AddForeignKey
ALTER TABLE `sessao` ADD CONSTRAINT `sessao_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `nivel` (`numeroNivel`, `nome`, `fatorDificuldade`, `tempoExposicaoMs`, `pontosMinimos`)
VALUES ('1', 'Fácil', 1.0000, 950, 0),
       ('2', 'Médio', 1.3768, 690, 0),
       ('3', 'Difícil', 2.0213, 470, 0)
ON DUPLICATE KEY UPDATE `numeroNivel` = VALUES(`numeroNivel`);
