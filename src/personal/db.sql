-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 29-07-2024 a las 07:55:51
-- Versión del servidor: 5.7.44
-- Versión de PHP: 8.1.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ferreimp_colaboradores`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `db`
--

CREATE TABLE `db` (
  `id` int(11) NOT NULL,
  `cedula` int(10) DEFAULT NULL,
  `nombre_completo` varchar(20) DEFAULT NULL,
  `apellido_completo` varchar(20) DEFAULT NULL,
  `cargo` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `db`
--

INSERT INTO `db` (`id`, `cedula`, `nombre_completo`, `apellido_completo`, `cargo`) VALUES
(1, 1019073263, 'Camilo Fernando ', 'Pazmi?o Rodriguez', 'Ejecutivo de las tic'),
(2, 1019073263, 'Carlos Andres ', 'Linares Bejarano ', 'Ejecutivo de las tic'),
(3, 1019073263, 'Cristian Camilo ', 'Reyes Perilla', 'Ejecutivo de las tic'),
(4, 1019073263, 'Cristian David ', 'Bonilla Cortes', 'Ejecutivo de las tic'),
(5, 1019073263, 'Diego Javier ', 'Pazmi?o Rodriguez ', 'Ejecutivo de las tic'),
(6, 1019073263, 'Erika Ximena ', 'Ramirez Juyo', 'Ejecutivo de las tic'),
(7, 1019073263, 'Fernando ', 'Pazmi?o Ocampo', 'Ejecutivo de las tic'),
(8, 1019073263, 'Jenny Paola ', 'Rodriguez Rodriguez ', 'Ejecutivo de las tic'),
(9, 1019073263, 'Jhon Anderson ', 'Hernandez Pineda ', 'Ejecutivo de las tic'),
(10, 1019073263, 'Jhonatan Dilbar ', 'Garzon Rodriguez', 'Ejecutivo de las tic'),
(11, 1019073263, 'Johan Camilo ', 'Fonseca Rodriguez', 'Ejecutivo de las tic'),
(12, 1019073263, 'John Sneider ', 'Martinez Padilla', 'Ejecutivo de las tic'),
(13, 1019073263, 'Jonathan Andres ', 'Hernandez Pertuz', 'Ejecutivo de las tic'),
(14, 1019073263, 'Jorge Camilo ', 'Gonzalez Rodriguez', 'Ejecutivo de las tic'),
(15, 1019073263, 'Juan David ', 'Forero Ortiz', 'Ejecutivo de las tic'),
(16, 1019073263, 'Karen Dayana ', 'Gonzalez Rodriguez', 'Ejecutivo de las tic'),
(17, 1019073263, 'Luis Alfonso ', 'Pabon Rodriguez', 'Ejecutivo de las tic'),
(18, 1019073263, 'Nancy ', 'Galvis', 'Ejecutivo de las tic'),
(19, 1019073263, 'Ruth Maritza ', 'Rodriguez Beltran', 'Ejecutivo de las tic'),
(20, 1019073263, 'Santiago ', 'Londo?o Rubio', 'Ejecutivo de las tic'),
(21, 1019073263, 'Wilmer Estiben ', 'Guzman Rojas', 'Ejecutivo de las tic'),
(22, 1019073263, 'Wiyer Mauricio ', 'Carpeta Buitrago', 'Ejecutivo de las tic'),
(23, 1019073263, 'Yurlay ', 'Bermudez Buitrago', 'Ejecutivo de las tic'),
(24, 1019073263, 'Yuvely Lucia', ' Jimenez Rodriguez', 'Ejecutivo de las tic'),
(25, 1019073263, 'Jose Manuel ', 'Ramos Ram?rez', 'Ejecutivo de las tic');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `db`
--
ALTER TABLE `db`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `db`
--
ALTER TABLE `db`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
