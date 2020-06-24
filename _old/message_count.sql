SELECT c.channel_id,
       SUM(IF(m.created_at < v.created_at,1,0)) AS viewedMessageCount,
       SUM(IF(m.created_at < v.created_at,0,1)) AS unViewedMessageCount
FROM channels c
     LEFT JOIN (SELECT uc.channel_id, IFNULL(m.created_at,'1900-01-01') AS created_at
                FROM messages m
                     LEFT JOIN user_channel uc ON m.message_id = uc.lasts_message_id AND
                                                   m.channel_id = uc.channel_id
                WHERE uc.user_id = {flask-session.user_id} AND
                      m.replies_to IS NULL) v ON c.channel_id = v.channel_id
     INNER JOIN messages m ON c.channel_id = m.channel_id
WHERE m.replies_to IS NULL;