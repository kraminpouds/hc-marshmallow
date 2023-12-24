import { Button, Card,  Form, Flex, Input, Typography, notification } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Box, Letter } from './model';
import { groupBy } from 'lodash-es';

function Home() {
    const [box, setBox] = useState<Box>();
    const [boxes, setBoxes] = useState<{[key: string]: Box[]}>();
    const [loading, setLoading] = useState<boolean>(false);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        axios.get('/api/box').then(r => {
            setBoxes(groupBy(r.data, b=>b.owner));
        });
    }, [])

    const onFinish = (value: Letter) => {
        setLoading(true);
        axios.put('/api/letter', value)
            .then(() => {
                api.success({ message: '提交成功' });
                setBox(undefined)
            })
            .catch(() => api.error({ message: '提交失败' })).then(()=>{
            setLoading(false);
        })
    };

    return (
        <>
            <Typography.Title className="title">狐乱生草の棉花糖</Typography.Title>
            { !box &&
                <Flex justify={'center'}  gap={64}>
                    <div style={{ width: 736, textAlign: 'center' }}>
                        <img src="/hu.png" style={{
                            objectFit: 'cover',
                            height: 240
                        }}/>
                        <Flex justify={'center'} gap={8} wrap={'wrap'}>
                        {
                            boxes && (boxes['狐']??[]).map(box=>(
                                <Card hoverable style={{ width: 240, height: 120 }} onClick={() => setBox(box)} key={box.uuid}>
                                    <Card.Meta title={box.name} description={box.description}/>
                                </Card>)
                            )
                        }
                        </Flex>
                    </div>
                    <div style={{ width: 736, textAlign: 'center'}}>
                        <img src="/cao.png" style={{
                            objectFit: 'cover',
                            height: 240
                        }} />
                        <Flex justify={'center'} gap={8} wrap={'wrap'}>
                            {
                                boxes && (boxes['草']??[]).map(box=>(
                                    <Card hoverable style={{ width: 240, height: 120 }} onClick={() => setBox(box)} key={box.uuid}>
                                        <Card.Meta title={box.name} description={box.description}/>
                                    </Card>)
                                )
                            }
                        </Flex>
                    </div>
                </Flex>
            }
            { box &&
                <Form onFinish={onFinish} autoComplete="off">
                    <Flex vertical align={'center'} gap={20}>
                        <Typography.Title level={3} style={{ color: 'white' }}>{box.name}</Typography.Title>
                        <Form.Item name="boxUUID" hidden initialValue={box.uuid}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="content" rules={[{ required: true, message: '请输入你要说的话' }]}>
                            <Input.TextArea style={{ width: 640, height: 480, resize: 'none' }} showCount maxLength={300} />
                        </Form.Item>
                        <Flex gap={20}>
                            <Button type="primary" htmlType="submit" loading={loading} >提交</Button>
                            <Button type="default" onClick={() => setBox(undefined)}>选择信箱</Button>
                        </Flex>
                    </Flex>
                </Form>
            }
            {contextHolder}
        </>
    )
}

export default Home
