-- CreateTable
CREATE TABLE `usuario` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(45) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nivel` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroNivel` VARCHAR(45) NOT NULL,
    `nome` VARCHAR(60) NOT NULL,
    `fatorDificuldade` DECIMAL(8, 4) NOT NULL,
    `tempoExposicaoMs` INTEGER NOT NULL,
    `pontosMinimos` INTEGER NOT NULL,

    UNIQUE INDEX `nivel_numeroNivel_key`(`numeroNivel`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `totalAparicoes` INTEGER NOT NULL,
    `totalAcertos` INTEGER NOT NULL,
    `totalErros` INTEGER NOT NULL,
    `maiorCombo` INTEGER NOT NULL,
    `pontuacaoBase` INTEGER NOT NULL,
    `pontuacaoBonus` INTEGER NOT NULL DEFAULT 0,
    `pontuacaoTotal` INTEGER NOT NULL,
    `duracaoSegundos` INTEGER NOT NULL,
    `registradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` INTEGER NOT NULL,
    `nivelId` INTEGER NOT NULL,

    INDEX `historico_nivelId_idx`(`nivelId`),
    UNIQUE INDEX `historico_usuarioId_ID_key`(`usuarioId`, `ID`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `placa` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `maiorPontuacao` INTEGER NOT NULL,
    `maiorComboGeral` INTEGER NOT NULL,
    `totalPartidasJogadas` INTEGER NOT NULL,
    `totalAcertosGeral` INTEGER NOT NULL,
    `atualizadoEm` DATETIME(3) NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `historicoId` INTEGER NOT NULL,

    UNIQUE INDEX `placa_usuarioId_key`(`usuarioId`),
    INDEX `placa_usuarioId_historicoId_idx`(`usuarioId`, `historicoId`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `historico` ADD CONSTRAINT `historico_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico` ADD CONSTRAINT `historico_nivelId_fkey` FOREIGN KEY (`nivelId`) REFERENCES `nivel`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `placa` ADD CONSTRAINT `placa_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `placa` ADD CONSTRAINT `placa_usuarioId_historicoId_fkey` FOREIGN KEY (`usuarioId`, `historicoId`) REFERENCES `historico`(`usuarioId`, `ID`) ON DELETE RESTRICT ON UPDATE CASCADE;
