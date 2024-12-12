final term requirement SY.2024-25 
Database Name = AssMan 
Table = CREATE TABLE assignments 
( id INT AUTO_INCREMENT PRIMARY KEY, 
title VARCHAR(255) NOT NULL, 
description TEXT, 
due_date DATETIME NOT NULL, -- Stores both date and time status 
BOOLEAN DEFAULT FALSE -- Default to 'Incomplete' 
);
