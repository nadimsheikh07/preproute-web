"use client";

import { Button, Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <Card style={{ maxWidth: 600 }}>
        <Title level={2}>Preproute</Title>

        <Paragraph>
          Test Management Application
        </Paragraph>

        <Button type="primary">
          Get Started
        </Button>
      </Card>
    </main>
  );
}