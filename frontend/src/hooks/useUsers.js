import { useState, useEffect, useCallback } from "react";
import { userService } from "../services/userService";
import toast from "react-hot-toast";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getAll();
      setUsers(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể tải danh sách users";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (data) => {
    try {
      const res = await userService.create(data);
      toast.success("Thêm user thành công!");
      await fetchUsers();
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi tạo user";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const updateUser = async (id, data) => {
    try {
      const res = await userService.update(id, data);
      toast.success("Cập nhật user thành công!");
      await fetchUsers();
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi cập nhật user";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const deleteUser = async (id) => {
    try {
      await userService.delete(id);
      toast.success("Xóa user thành công!");
      await fetchUsers();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi xóa user";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
