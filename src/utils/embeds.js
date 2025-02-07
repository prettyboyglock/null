const { EmbedBuilder } = require('discord.js');

module.exports = {
  // Base embed creator with common properties
  createEmbed: (title, description, color = '#0099ff', options = {}) => {
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    if (options.fields) embed.addFields(options.fields);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.footer) embed.setFooter(options.footer);
    if (options.image) embed.setImage(options.image);
    if (options.author) embed.setAuthor(options.author);
    
    return embed;
  },

  // Pre-configured embeds for common use cases
  successEmbed: (description, title = 'Success') => 
    this.createEmbed(title, description, '#00FF00'),

  errorEmbed: (description, title = 'Error') => 
    this.createEmbed(title, description, '#FF0000'),

  warningEmbed: (description, title = 'Warning') => 
    this.createEmbed(title, description, '#FFA500'),

  infoEmbed: (description, title = 'Information') => 
    this.createEmbed(title, description, '#00BFFF'),

  // Specialized embeds
  userInfoEmbed: (member, strikeCount) => {
    return this.createEmbed(
      `User Info: ${member.user.tag}`,
      `Account created: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
      '#00FF00',
      {
        thumbnail: member.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: 'ID', value: member.id, inline: true },
          { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
          { name: 'Highest Role', value: member.roles.highest.toString(), inline: true },
          { name: 'Strike Count', value: `${strikeCount}`, inline: true },
          { name: 'Roles', value: member.roles.cache.map(r => r.toString()).slice(0, 10).join(' ') || 'None' }
        ]
      }
    );
  },

  moderationEmbed: (action, user, moderator, reason, duration) => {
    const colorMap = {
      ban: '#FF0000',
      kick: '#FFA500',
      timeout: '#FFD700',
      strike: '#FF6347',
      default: '#0099ff'
    };

    return this.createEmbed(
      `${action} | Moderation Action`,
      `**User:** ${user.tag} (${user.id})`,
      colorMap[action.toLowerCase()] || colorMap.default,
      {
        fields: [
          { name: 'Moderator', value: moderator.tag, inline: true },
          { name: 'Reason', value: reason || 'No reason provided', inline: true },
          ...(duration ? [{ name: 'Duration', value: duration, inline: true }] : [])
        ]
      }
    );
  },

  confirmationEmbed: (action, details) => 
    this.createEmbed(
      `Confirm ${action}`,
      details,
      '#FFD700',
      {
        footer: { text: 'This action cannot be undone!' }
      }
    ),

  roleEmbed: () => 
    this.createEmbed(
      '🎭 Role Selection',
      'Click the buttons below to get the corresponding roles!',
      '#00FF00'
    ),

  logEmbed: (title, fields) => 
    this.createEmbed(
      `📄 ${title}`,
      '',
      '#2F3136',
      { fields }
    )
};