'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Input, message } from 'antd';
import {
  LockOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Controller, useForm } from 'react-hook-form';
import { authService } from '@/services/auth.service';

interface LoginFormValues {
  userId: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      userId: '',
      password: '',
      remember: true,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);

      const response = await authService.login({
        userId: values.userId,
        password: values.password,
      });

      console.log('Login response:', response);

      message.success(response.message || 'Login successful');

      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to sign in. Please try again.';

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT — ILLUSTRATION
        ====================================================== */}
        <section className="relative hidden min-h-screen overflow-hidden bg-[#EAF3FF] lg:flex">

          {/* Background decoration */}
          <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-white/70" />

          <div className="absolute -bottom-56 -left-56 h-[700px] w-[700px] rounded-full bg-[#D7E9FF]" />

          <div className="absolute left-[12%] top-[18%] h-3 w-3 rounded-full bg-white/80" />

          <div className="absolute right-[18%] top-[30%] h-5 w-5 rounded-full bg-white/70" />

          <div className="absolute bottom-[20%] right-[12%] h-3 w-3 rounded-full bg-white/80" />

          <div className="absolute left-[22%] top-[42%] h-2 w-2 rounded-full bg-[#C2DDFF]" />

          {/* Illustration content */}
          <div className="relative z-10 flex w-full flex-col items-center justify-center px-10 py-12 xl:px-16">

            {/* Image */}
            <div className="w-full max-w-[500px]">
              <Image
                src="/images/TEST TUBE MAN.svg"
                alt="Test management illustration"
                width={600}
                height={600}
                priority
                className="mx-auto h-auto w-full object-contain"
              />
            </div>

            {/* Text */}
            <div className="mt-4 max-w-[520px] text-center">
              <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#101828] sm:text-[28px]">
                Build. Manage. Assess.
              </h2>

              <p className="mx-auto mt-3 max-w-[450px] text-[15px] leading-7 text-[#667085]">
                Create engaging tests, manage questions, and publish
                assessments — all from one powerful platform.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT — LOGIN
        ====================================================== */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">

          <div className="w-full max-w-[430px]">

            {/* Logo */}
            <div className="mb-10">
              <Image
                src="/logo.svg"
                alt="Test Management"
                width={180}
                height={60}
                priority
                className="h-auto w-auto"
              />
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-[30px] font-bold leading-[1.2] tracking-[-0.03em] text-[#101828] sm:text-[34px]">
                Sign in to your account
              </h1>

              <p className="mt-3 text-[15px] leading-6 text-[#667085]">
                Welcome back! Please enter your details to continue.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >

              {/* User ID */}
              <div>
                <label
                  htmlFor="userId"
                  className="mb-2 block text-[14px] font-semibold text-[#344054]"
                >
                  User ID
                </label>

                <Controller
                  name="userId"
                  control={control}
                  rules={{
                    required: 'User ID is required',
                    minLength: {
                      value: 3,
                      message: 'User ID must be at least 3 characters',
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="userId"
                      size="large"
                      placeholder="Enter your user ID"
                      prefix={
                        <UserOutlined className="mr-1 text-[#98A2B3]" />
                      }
                      status={errors.userId ? 'error' : undefined}
                      className="!h-[52px] !rounded-[8px] !border-[#D0D5DD]"
                      autoComplete="username"
                    />
                  )}
                />

                {errors.userId && (
                  <p className="mt-1.5 text-[13px] text-[#D92D20]">
                    {errors.userId.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[14px] font-semibold text-[#344054]"
                >
                  Password
                </label>

                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      id="password"
                      size="large"
                      placeholder="Enter your password"
                      prefix={
                        <LockOutlined className="mr-1 text-[#98A2B3]" />
                      }
                      status={errors.password ? 'error' : undefined}
                      className="!h-[52px] !rounded-[8px] !border-[#D0D5DD]"
                      autoComplete="current-password"
                    />
                  )}
                />

                {errors.password && (
                  <p className="mt-1.5 text-[13px] text-[#D92D20]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between pt-1">
                <Controller
                  name="remember"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(event) =>
                        field.onChange(event.target.checked)
                      }
                    >
                      <span className="text-[14px] text-[#475467]">
                        Remember me
                      </span>
                    </Checkbox>
                  )}
                />

                <button
                  type="button"
                  onClick={() =>
                    message.info(
                      'Please contact your administrator to reset your password.'
                    )
                  }
                  className="text-[14px] font-semibold text-[#1677FF] transition-colors hover:text-[#0958D9]"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                block
                loading={loading}
                icon={!loading && <ArrowRightOutlined />}
                iconPosition="end"
                className="!mt-7 !h-[52px] !rounded-[8px] !border-0 !bg-[#1677FF] !text-[15px] !font-semibold shadow-[0_4px_14px_rgba(22,119,255,0.20)] transition-all hover:!bg-[#0958D9]"
              >
                Sign in
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-12 border-t border-[#EAECF0] pt-6 text-center">
              <p className="text-[13px] text-[#98A2B3]">
                © {new Date().getFullYear()} Test Management System
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}