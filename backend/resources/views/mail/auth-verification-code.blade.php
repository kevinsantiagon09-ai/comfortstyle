<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu cuenta</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f5f7fa; font-family: Arial, sans-serif; color: #1f2937;">
    <main style="max-width: 480px; margin: auto; padding: 32px; background-color: #ffffff; border-radius: 16px;">
        <h1 style="font-size: 24px; margin-top: 0;">Verifica tu cuenta</h1>
        <p>Usa este código para completar tu registro o iniciar sesión en Comfort Style:</p>
        <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center;">{{ $code }}</p>
        <p>El código vence en {{ $expiresInMinutes }} minutos y solo se puede usar una vez.</p>
        <p>No compartas este código. Si no solicitaste esta verificación, puedes ignorar este correo.</p>
    </main>
</body>
</html>
