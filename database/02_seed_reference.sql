USE SmartScheduling;
GO

-- Reference seed data. Adjust names to actual store roles/skills before production.

IF NOT EXISTS (SELECT 1 FROM dbo.positions WHERE name = N'Manager')
    INSERT INTO dbo.positions(name, description) VALUES (N'Manager', N'Store operational manager');

IF NOT EXISTS (SELECT 1 FROM dbo.positions WHERE name = N'Shift Lead')
    INSERT INTO dbo.positions(name, description) VALUES (N'Shift Lead', N'Leads a shift');

IF NOT EXISTS (SELECT 1 FROM dbo.positions WHERE name = N'Barista')
    INSERT INTO dbo.positions(name, description) VALUES (N'Barista', N'Coffee and beverage preparation');

IF NOT EXISTS (SELECT 1 FROM dbo.positions WHERE name = N'Cashier')
    INSERT INTO dbo.positions(name, description) VALUES (N'Cashier', N'POS and payment handling');

IF NOT EXISTS (SELECT 1 FROM dbo.positions WHERE name = N'Waiter')
    INSERT INTO dbo.positions(name, description) VALUES (N'Waiter', N'Customer service');

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE name = N'Coffee Making')
    INSERT INTO dbo.skills(name, description) VALUES (N'Coffee Making', N'Coffee preparation skill');

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE name = N'POS')
    INSERT INTO dbo.skills(name, description) VALUES (N'POS', N'Point-of-sale operation');

IF NOT EXISTS (SELECT 1 FROM dbo.skills WHERE name = N'Customer Service')
    INSERT INTO dbo.skills(name, description) VALUES (N'Customer Service', N'Customer-facing service');

-- Monday..Sunday example operating hours
DECLARE @d TINYINT = 1;
WHILE @d <= 7
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.operating_hours WHERE day_of_week = @d)
        INSERT INTO dbo.operating_hours(day_of_week, open_time, close_time, is_closed)
        VALUES (@d, '07:00', '22:00', 0);
    SET @d += 1;
END;
GO

PRINT 'Reference seed data inserted.';
GO
