CREATE OR REPLACE FUNCTION admin_user_action(action text, user_ids uuid[])
RETURNS SETOF users AS $$
BEGIN
  IF action = 'activate' THEN
    RETURN QUERY
      UPDATE users SET status = 'active'
      WHERE id = ANY(user_ids)
      RETURNING *;
  ELSIF action = 'suspend' THEN
    RETURN QUERY
      UPDATE users SET status = 'suspended'
      WHERE id = ANY(user_ids)
      RETURNING *;
  ELSIF action = 'delete' THEN
    RETURN QUERY
      UPDATE users SET status = 'deleted'
      WHERE id = ANY(user_ids)
      RETURNING *;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;